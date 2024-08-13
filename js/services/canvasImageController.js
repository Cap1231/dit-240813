export class CanvasImageController {
    constructor(canvasId, imageUrl) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.img =  new Image();
        this.imgPos = null; // Canvas内で表示している画像の絶対座標
        this.rectangles = []; // 選択した矩形たちの絶対座標
        this.currentRect = null; // 現在選択している矩形の絶対座標
        this.startPos = null; // ドラッグ開始点の絶対座標
        this.isDragging = false;

        this.setupImage(imageUrl);
        this.attachEventListeners();
    }

    setupImage(imageUrl) {
        this.img.src = imageUrl;
        this.img.onload = () => {
            this.resizeCanvas();
            this.imgPos = this.getImagePositionOnCanvas();
            this.drawImage();
        };
    }

    resizeCanvas() {
        // NOTE: 仮で適当にセットしてます
        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = window.innerHeight * 0.8;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 全ての矩形を描画して、Canvasを最新にする
    updateCanvas() {
        this.clearCanvas();
        this.drawImage();
        this.drawRectangles();
    }

    getImagePositionOnCanvas() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const ratio = Math.min(canvasWidth / this.img.width, canvasHeight / this.img.height);
        const newWidth = Math.round(this.img.width * ratio);
        const newHeight = Math.round(this.img.height * ratio);
        return {
            x: Math.round((canvasWidth - newWidth) / 2),
            y: Math.round((canvasHeight - newHeight) / 2),
            width: newWidth,
            height: newHeight
        };
    }

    //
    // Canvas内の画像描画
    //
    drawImage() {
        const { x, y, width, height } = this.imgPos;
        this.ctx.drawImage(this.img, x, y, width, height);
    }

    //
    // Canvas内の矩形描画
    //
    drawRectangle(rect) {
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    // 現在ドラッグしている矩形を描画
    drawCurrentRectangle() {
        this.drawRectangle(this.currentRect);
    }

    // 全ての矩形を描画
    drawRectangles() {
        this.rectangles.forEach(rect => this.drawRectangle(rect));
    }

    //
    // 矩形描画処理中のステート管理
    //
    // 描画されている矩形に新規で描画する矩形を追加
    addCurrentRectangle() {
        this.rectangles.push(this.currentRect);
    }

    // 現在ドラッグで描画している矩形情報を計算する
    // x: ドラッグ開始点と現在点のうち、小さい方を x 座標とする
    // y: ドラッグ開始点と現在点のうち、小さい方を y 座標とする
    // width : 始点と現在点の差の絶対値の高さ
    // height: 始点と現在点の差の絶対値の幅
    calcCurrentRectangle(e) {
        this.currentRect = {
            x: Math.min(this.startPos.x, e.offsetX),
            y: Math.min(this.startPos.y, e.offsetY),
            width: Math.abs(e.offsetX - this.startPos.x),
            height: Math.abs(e.offsetY - this.startPos.y)
        }
    }

    // ドラッグ開始時に管理するステートをセット
    setDraggingState(e) {
        this.startPos = {
            x: e.offsetX,
            y: e.offsetY
        };
        this.currentRect = {
            x: e.offsetX,
            y: e.offsetY,
            width: 0,
            height: 0
        }
        this.isDragging = true;
    }

    // ドラッグ終了時に管理していたステートをリセット
    resetDraggingState() {
        this.startPos = null;
        this.currentRect = null;
        this.isDragging = false;
    }

    //
    // Validation
    //
    // ドラッグした矩形が既存のいずれかの矩形と重複していないか確認
    checkOverlap() {
        return this.rectangles.some(rect => this.checkRectanglesOverlap(rect, this.currentRect));
    }

    checkRectanglesOverlap(rect1, rect2) {
        return !(rect2.x > rect1.x + rect1.width ||
            rect2.x + rect2.width < rect1.x ||
            rect2.y > rect1.y + rect1.height ||
            rect2.y + rect2.height < rect1.y);
    }

    // 矩形が画像内にあるかチェック
    checkWithinImage() {
        const rect = this.currentRect
        return rect.x >= this.imgPos.x &&
            rect.x + rect.width <= this.imgPos.x + this.imgPos.width &&
            rect.y >= this.imgPos.y &&
            rect.y + rect.height <= this.imgPos.y + this.imgPos.height;
    }

    //
    // ErrorHandler
    //
    handleRectangleCreationError(message) {
        alert(message);
        this.updateCanvas()
        this.resetDraggingState()
    }

    //
    // EventListener
    //
    attachEventListeners() {
        this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.handleMouseUp(e));
    }

    handleMouseDown(e) {
        this.setDraggingState(e)
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        this.updateCanvas()
        // 現在ドラッグしている矩形を描画
        this.calcCurrentRectangle(e)
        this.drawCurrentRectangle();
    }

    handleMouseUp(e) {
        if (!this.isDragging || !this.currentRect) return;

        // 矩形が画像内にあるかチェック
        if (!this.checkWithinImage()) {
            this.handleRectangleCreationError('Error: 画像の範囲外を選択しています');
            return;
        }

        // 矩形の重複チェック
        if (this.checkOverlap()) {
            this.handleRectangleCreationError('Error: 重複しました');
            return;
        }

        this.addCurrentRectangle()
        this.updateCanvas()
        this.resetDraggingState()
    }
}
