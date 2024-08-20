import {COLORS} from "../constants"

export class CanvasImageController {
    constructor(canvasId, imageUrl) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext('2d')
        this.img = new Image()
        this.imgPos = null // Canvas内で表示している画像の絶対座標
        this.rectangles = [] // 描画した矩形たちの絶対座標
        this.currentRect = null // 現在ドラッグしている矩形の絶対座標
        this.startPos = null // ドラッグ開始点の絶対座標
        this.isDragging = false
        this.onRectSelected = null // 矩形を右クリック押下時に呼び出すコールバック(外部から設定)
        this.longPressTimer = null // ロングプレスタイマーのIDを保持
        this.longPressTriggered = false // ロングプレスがトリガーされたかどうか

        this.setupImage(imageUrl)
        this.setupEventListeners()
    }

    //
    // EventListener
    //
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e))
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e))
        this.canvas.addEventListener('mouseup', e => this.handleMouseUp(e))
        // 矩形を右クリックで選択
        this.canvas.addEventListener('contextmenu', e => this.handleRectRightClick(e))

        // TODO: Refactor
        // タッチイベント
        this.canvas.addEventListener('touchstart', e => this.handleTouchStart(e))
        this.canvas.addEventListener('touchmove', e => this.handleTouchMove(e))
        this.canvas.addEventListener('touchend', e => this.handleTouchEnd(e))
    }

    setupImage(imageUrl) {
        this.img.src = imageUrl
        this.img.onload = () => {
            this.resizeCanvas()
            this.imgPos = this.getImagePositionOnCanvas()
            this.drawImage()
        }
    }

    resizeCanvas() {
        // NOTE: 仮で適当にセットしてます
        this.canvas.width = window.innerWidth * 0.8
        this.canvas.height = window.innerHeight * 0.8
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    // 全ての矩形を描画して、Canvasを最新にする
    updateCanvas() {
        this.clearCanvas()
        this.drawImage()
        this.drawRectangles()
    }

    getImagePositionOnCanvas() {
        const canvasWidth = this.canvas.width
        const canvasHeight = this.canvas.height
        const ratio = Math.min(canvasWidth / this.img.width, canvasHeight / this.img.height)
        const newWidth = Math.round(this.img.width * ratio)
        const newHeight = Math.round(this.img.height * ratio)
        return {
            x: Math.round((canvasWidth - newWidth) / 2),
            y: Math.round((canvasHeight - newHeight) / 2),
            width: newWidth,
            height: newHeight
        }
    }

    //
    // Canvas内の画像描画
    //
    drawImage() {
        const {x, y, width, height} = this.imgPos
        this.ctx.drawImage(this.img, x, y, width, height)
    }

    //
    // Canvas内の矩形描画
    //
    drawRectangle(rect) {
        const allRegistered = rect.partNumberRegistered && rect.transitionImageRegistered
        this.ctx.strokeStyle = allRegistered ? COLORS.registered : COLORS.inProgress
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    }

    // 現在ドラッグしている矩形を描画
    drawCurrentRectangle() {
        this.drawRectangle(this.currentRect)
    }

    // 全ての矩形を描画
    drawRectangles() {
        this.rectangles.forEach(rect => this.drawRectangle(rect))
    }

    //
    // ドラッグしている矩形
    //
    // ドラッグした矩形を rectangles に追加
    addCurrentRectangle() {
        this.rectangles.push(this.currentRect)
    }

    // 現在ドラッグしている矩形情報を計算する
    // x: ドラッグ開始点と現在点のうち、小さい方を x 座標とする
    // y: ドラッグ開始点と現在点のうち、小さい方を y 座標とする
    // width : 始点と現在点の差の絶対値の高さ
    // height: 始点と現在点の差の絶対値の幅
    calcCurrentRectangle(curPos) {
        this.currentRect = {
            ...this.currentRect,
            x: Math.min(this.startPos.x, curPos.x),
            y: Math.min(this.startPos.y, curPos.y),
            width: Math.abs(curPos.x - this.startPos.x),
            height: Math.abs(curPos.y - this.startPos.y)
        }
    }

    // ドラッグ開始時に管理するステートをセット
    setDraggingState(curPos) {
        this.startPos = {
            x: curPos.x,
            y: curPos.y
        }
        this.currentRect = {
            x: curPos.x,
            y: curPos.y,
            width: 0,
            height: 0,
            partNumberRegistered: false,
            transitionImageRegistered: false
        }
        this.isDragging = true
    }

    // ドラッグ終了時に管理していたステートをリセット
    resetDraggingState() {
        this.startPos = null
        this.currentRect = null
        this.isDragging = false
    }

    //
    // 描画した矩形
    //
    // 矩形を探す
    findRectangleAtPosition(curPos) {
        const {x, y} = curPos
        return this.rectangles.find(rect =>
            x >= rect.x && x <= rect.x + rect.width &&
            y >= rect.y && y <= rect.y + rect.height
        )
    }

    // 矩形を削除
    deleteRectangle(rect) {
        // TODO：要検討。ID 比較が必要？
        this.rectangles = this.rectangles.filter(r => r !== rect)
    }


    // ImagePartRegistrationProcess で処理した矩形情報をsourceRectを更新
    updateRectangle(sourceRect, processedRect) {
        if (processedRect.deleted === true) {
            this.deleteRectangle(sourceRect)
        } else {
            this.updateRectangleStatus(sourceRect, processedRect)
        }
    }

    // ImagePartRegistrationProcess で処理した矩形データで元の矩形データを更新
    updateRectangleStatus(sourceRect, processedRect) {
        sourceRect.partNumberRegistered = processedRect.partNumberRegistered
        sourceRect.transitionImageRegistered = processedRect.transitionImageRegistered
    }

    //
    // ImagePartRegistrationProcess 用
    //
    // ImagePartRegistrationProcess で利用できる形に変換する
    formatRectangle(rect) {
        const relativeRect = this.convertToRelativeCoordinates(rect)
        return {
            x: relativeRect.x,
            y: relativeRect.y,
            width: relativeRect.width,
            height: relativeRect.height,
            partNumberRegistered: rect.partNumberRegistered,
            transitionImageRegistered: rect.transitionImageRegistered,
            deleted: false,
        }
    }

    // 矩形を相対座標に変換する
    // 相対座標は、0 ~ 1 (特に小数点以下を丸めていない)
    convertToRelativeCoordinates(rect) {
        // 画像の左上からの矩形の相対座標を計算
        const relativeX = (rect.x - this.imgPos.x) / this.imgPos.width
        const relativeY = (rect.y - this.imgPos.y) / this.imgPos.height
        const relativeWidth = rect.width / this.imgPos.width
        const relativeHeight = rect.height / this.imgPos.height

        return {
            x: relativeX,
            y: relativeY,
            width: relativeWidth,
            height: relativeHeight
        }
    }

    //
    // Validation
    //
    // ドラッグした矩形が既存のいずれかの矩形と重複していないか確認
    checkOverlap() {
        return this.rectangles.some(rect => this.checkRectanglesOverlap(rect, this.currentRect))
    }

    checkRectanglesOverlap(rect1, rect2) {
        return !(rect2.x > rect1.x + rect1.width ||
            rect2.x + rect2.width < rect1.x ||
            rect2.y > rect1.y + rect1.height ||
            rect2.y + rect2.height < rect1.y)
    }

    // 矩形が画像内にあるかチェック
    checkWithinImage() {
        const rect = this.currentRect
        return rect.x >= this.imgPos.x &&
            rect.x + rect.width <= this.imgPos.x + this.imgPos.width &&
            rect.y >= this.imgPos.y &&
            rect.y + rect.height <= this.imgPos.y + this.imgPos.height
    }

    //
    // ErrorHandler
    //
    handleRectangleCreationError(message) {
        if (message) alert(message)
        this.updateCanvas()
        this.resetDraggingState()
    }


    //
    // MouseEvent
    //
    handleMouseDown(e) {
        if (e.button !== 0) return // 左クリック以外は無視
        const curPos = {
            x: e.offsetX,
            y: e.offsetY
        }
        this.handleRectDrawingStart(curPos)
    }

    handleMouseMove(e) {
        const curPos = {
            x: e.offsetX,
            y: e.offsetY
        }
        this.handleRectDrawingContinue(curPos)
    }

    handleMouseUp(e) {
        this.handleRectDrawingEnd()
    }


    handleRectDrawingStart(curPos) {
        this.setDraggingState(curPos)
    }

    handleRectDrawingContinue(curPos) {
        if (!this.isDragging) return

        this.updateCanvas()

        // 現在ドラッグしている矩形を描画
        this.calcCurrentRectangle(curPos)
        this.drawCurrentRectangle()
    }

    handleRectDrawingEnd() {
        if (!this.isDragging || !this.currentRect) return

        // 高さと幅が無い矩形は登録しない
        if (this.currentRect.width === 0 || this.currentRect.height === 0) {
            this.handleRectangleCreationError(null)
            return
        }


        // 矩形が画像内にあるかチェック
        if (!this.checkWithinImage()) {
            this.handleRectangleCreationError('画像の範囲外を選択しています！')
            return
        }

        // 矩形の重複チェック
        if (this.checkOverlap()) {
            this.handleRectangleCreationError('描画範囲が重複しています！')
            return
        }

        this.addCurrentRectangle()
        this.updateCanvas()
        this.resetDraggingState()
    }

    async handleRectRightClick(e) {
        e.preventDefault()  // デフォルトのコンテキストメニューをキャンセル

        const curPos = {
            x: e.offsetX,
            y: e.offsetY
        }

        await this.handleRectSelect(curPos)
    }

    // onRectSelected をセットしていない場合、デフォルトのコンテキストメニューを表示し、
    // セットされている場合は、右クリックした場所にある矩形情報を取得し、onRectSelectedを呼び出す
    async handleRectSelect(curPos) {
        if (!this.onRectSelected) return

        const selectedRect = this.findRectangleAtPosition(curPos)
        if (!selectedRect) return

        // ImagePartRegistrationProcess で利用できる形に変換する
        const formattedRect = this.formatRectangle(selectedRect)

        try {
            const processedRect = await this.onRectSelected(formattedRect)
            this.updateRectangle(selectedRect, processedRect)
            this.updateCanvas()
            console.log('登録後の矩形情報一覧', this.rectangles)
        } catch (err) {
            console.error('部位番号 or 遷移先画像の登録失敗', err)
        }
    }

    handleTouchStart(e) {
        // 長押し
        this.handleLongPressStart(e)
        // 普通のタッチ
        this.handleTouchDrawStart(e)
    }

    handleLongPressStart(e) {
        this.longPressTriggered = false
        this.longPressTimer = setTimeout(async () => {
            this.longPressTriggered = true
            // TODO: 共通化
            const touch = e.touches[0] // 最初のタッチポイントを取得
            const curPos = {
                x: touch.clientX,
                y: touch.clientY
            }
            await this.handleRectSelect(curPos)
        }, 500)  // 500msがロングタップとして扱う
    }

    handleTouchDrawStart(e) {
        e.preventDefault() // スクロールやズームを防ぐ
        // TODO: 共通化
        const touch = e.touches[0] // 最初のタッチポイントを取得
        const curPos = {
            x: touch.clientX,
            y: touch.clientY
        }
        this.handleRectDrawingStart(curPos)
    }

    handleTouchMove(e) {
        clearTimeout(this.longPressTimer)
        // TODO: 関数切り出し ＆ ロジック要チェック
        const curPos = {
            x: e.touches[0].clientX - this.canvas.getBoundingClientRect().left,
            y: e.touches[0].clientY - this.canvas.getBoundingClientRect().top
        }
        this.handleRectDrawingContinue(curPos)
    }

    handleTouchEnd(e) {
        clearTimeout(this.longPressTimer)
        if (!this.longPressTriggered) {
            this.handleRectDrawingEnd()
        }
        this.longPressTriggered = false
    }
}
