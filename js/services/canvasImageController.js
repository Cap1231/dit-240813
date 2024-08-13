export class CanvasImageController {
    constructor(canvasId, imageUrl) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.imgPos = null; // Canvas内で表示している画像の絶対座標
        this.rectangles = []; // 選択した矩形たちの絶対座標
        this.currentRect = null; // 現在選択している矩形の絶対座標
        this.startPos = null;  // ドラッグ開始点の絶対座標
        this.isDragging = false;
        this.img =  new Image();

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

    drawImage() {
        const { x, y, width, height } = this.imgPos;
        this.ctx.drawImage(this.img, x, y, width, height);
    }

    drawRectangle(rect) {
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    drawDraggedRectangle(rect) {
        this.drawRectangle(rect);
    }

    drawRectangles() {
        this.rectangles.forEach(rect => this.drawRectangle(rect));
    }

    checkOverlap(newRect) {
        return this.rectangles.some(rect => this.rectanglesOverlap(rect, newRect));
    }

    // TODO: 名前
    rectanglesOverlap(rect1, rect2) {
        return !(rect2.x > rect1.x + rect1.width ||
            rect2.x + rect2.width < rect1.x ||
            rect2.y > rect1.y + rect1.height ||
            rect2.y + rect2.height < rect1.y);
    }

    checkWithinImage(rect) {
        return rect.x >= this.imgPos.x &&
            rect.x + rect.width <= this.imgPos.x + this.imgPos.width &&
            rect.y >= this.imgPos.y &&
            rect.y + rect.height <= this.imgPos.y + this.imgPos.height;
    }

    attachEventListeners() {
        this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.handleMouseUp(e));
    }

    handleMouseDown(e) {
        this.startPos = {
            x: e.offsetX,
            y: e.offsetY
        };
        this.isDragging = true;
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        this.clearCanvas();
        this.drawImage();
        this.drawRectangles();

        console.log(this.startPos)
        console.log(this.currentRect)
        this.currentRect = {
            x: Math.min(this.startPos.x, e.offsetX),
            y: Math.min(this.startPos.y, e.offsetY),
            width: Math.abs(e.offsetX - this.startPos.x),
            height: Math.abs(e.offsetY - this.startPos.y)
        };
        this.drawDraggedRectangle(this.currentRect);
    }

    handleMouseUp(e) {
        if (!this.isDragging || !this.currentRect) return;

        // 矩形が画像内にあるかチェック
        if (!this.checkWithinImage(this.currentRect)) {
            this.handleRectangleCreationError('Error: 矩形が画像の範囲外です。');
            return;
        }

        // 矩形の重複チェック
        if (this.checkOverlap(this.currentRect)) {
            this.handleRectangleCreationError('Error: 重複しました。');
            return;
        }

        this.rectangles.push(this.currentRect);

        this.clearCanvas();
        this.drawImage();
        this.drawRectangles();

        this.currentRect = null;
        this.isDragging = false;
    }

    handleRectangleCreationError(message) {
        alert(message);

        this.clearCanvas();
        this.drawImage();
        this.drawRectangles();

        this.currentRect = null;
        this.isDragging = false;
    }
}
