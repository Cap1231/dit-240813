import {COLORS} from "../constants"

export class RectDrawer {
    constructor(canvasId, imageUrl, rects = []) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext('2d')
        this.img = new Image()
        this.imgPos = null // Canvas内で表示している画像の絶対座標
        this.rects = [] // 描画した矩形全ての絶対座標
        this.currentRect = null // 描画中の矩形の絶対座標
        this.startPos = null // ドラッグ開始点の絶対座標
        this.isDrawing = false
        this.onRectSelected = null // 矩形を右クリック押下時に呼び出すコールバック(外部から設定)
        this.longPressTimer = null // ロングプレスタイマーのIDを保持
        this.longPressTriggered = false // ロングプレスがトリガーされたかどうか

        this.setupImage(imageUrl, rects)
        this.setupEventListeners()
        this.drawRects()
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e))
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e))
        this.canvas.addEventListener('mouseup', e => this.handleMouseUp(e))
        // 矩形を右クリックで選択
        this.canvas.addEventListener('contextmenu', e => this.handleRectRightClick(e))

        // タッチイベント
        this.canvas.addEventListener('touchstart', e => this.handleTouchStart(e))
        this.canvas.addEventListener('touchmove', e => this.handleTouchMove(e))
        this.canvas.addEventListener('touchend', e => this.handleTouchEnd(e))
    }

    setupImage(imageUrl, rects) {
        this.img.src = imageUrl
        this.img.onload = () => {
            this.resizeCanvas()
            this.imgPos = this.getImagePosition()
            this.drawImage()
            if (rects.length > 0) {
                // NOTE: Imageを描画した後でないと矩形は描画できない
                this.rects = rects.map(rect => this.convertToRectWithAbsolute(rect))
                this.drawRects()
            }
            console.log('初回に描画する矩形', this.rects)
        }
    }

    //
    // PC - MouseEvent
    //
    // クリック
    handleMouseDown(e) {
        if (e.button !== 0) return // 左クリック以外は無視
        const curPos = this.getCurrentMousePos(e)
        this.setRectDrawState(curPos)
    }

    handleMouseMove(e) {
        const curPos = this.getCurrentMousePos(e)
        this.updateRectDraw(curPos)
    }

    handleMouseUp(e) {
        this.finalizeRectDraw()
    }

    // 右クリック
    async handleRectRightClick(e) {
        e.preventDefault()  // デフォルトのコンテキストメニューをキャンセル

        const curPos = this.getCurrentMousePos(e)
        await this.processSelectedRect(curPos)
    }

    //
    // SP - TouchEvent
    //
    // PC の右クリックの代わりは、長押し
    handleTouchStart(e) {
        // 長押し
        this.setLongPressDetection(e)

        // 普通のタッチ
        e.preventDefault() // スクロールやズームを防ぐ
        const curPos = this.getCurrentTouchPos(e)
        this.setRectDrawState(curPos)
    }

    handleTouchMove(e) {
        clearTimeout(this.longPressTimer)
        const curPos = this.getCurrentTouchPos(e)
        this.updateRectDraw(curPos)
    }

    handleTouchEnd(e) {
        clearTimeout(this.longPressTimer)
        if (this.longPressTriggered) {
            this.longPressTriggered = false
        } else {
            this.finalizeRectDraw()
        }
    }

    //
    // Canvas全体
    //
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
        this.drawRects()
    }

    //
    // Canvas内の画像
    //
    getImagePosition() {
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

    drawImage() {
        const {x, y, width, height} = this.imgPos
        this.ctx.drawImage(this.img, x, y, width, height)
    }

    //
    // Canvas内の矩形
    //
    // 現在ドラッグ(タッチ)している矩形 currentRect を描画
    drawCurrentRect() {
        this.drawRect(this.currentRect)
    }

    // 全ての矩形 rects を描画
    drawRects() {
        this.rects.forEach(rect => this.drawRect(rect))
    }

    // 引数で渡された矩形を描画
    // partNumber と　transitionImage が登録済みの矩形は、緑色になる。それ以外は、赤色
    drawRect(rect) {
        const allRegistered = rect.partNumberRegistered && rect.transitionImageRegistered
        const targetColor = allRegistered ? COLORS.registered : COLORS.inProgress
        this.ctx.strokeStyle = targetColor
        this.ctx.lineWidth = 4
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

        if (rect.id) this.drawId(rect, targetColor)
    }

    // 矩形内の左上にIDを描画
    drawId(rect, bgColor) {
        const text = `${rect.id}`
        const fontSize = 14
        const textMargin = 5
        const textX = rect.x + textMargin
        const textY = rect.y + fontSize
        const textWidth = this.ctx.measureText(text).width
        const textHeight = fontSize

        // テキストの背景色を設定
        this.ctx.fillStyle = bgColor
        this.ctx.fillRect(textX - textMargin, rect.y, textWidth + (textMargin * 2), textHeight + textMargin);

        // テキストを描画
        this.ctx.fillStyle = '#fff' // テキスト色
        this.ctx.font = `${fontSize}px Arial` // フォント設定
        this.ctx.fillText(text, textX, textY)
    }

    // ドラッグ(タッチ)した矩形を rects に追加
    addCurrentRect() {
        this.rects.push({
            ...this.currentRect,
            id: null,
        })
    }

    // ドラッグ(タッチ)している矩形 currentRect を更新
    updateCurrentRect(curPos) {
        this.currentRect = {
            ...this.currentRect,
            ...this.calcCurrentRectPos(curPos),
        }
    }

    // rects から curPos を含む矩形を探す
    findRectAtPosition(curPos) {
        const {x, y} = curPos
        return this.rects.find(rect =>
            x >= rect.x && x <= rect.x + rect.width &&
            y >= rect.y && y <= rect.y + rect.height
        )
    }

    // 指定した矩形を processedRect で更新 or 指定した矩形を rects から削除
    updateOrDeleteTargetRect(targetRect, processedRect) {
        if (processedRect.deleted === true) {
            this.deleteTargetRect(targetRect)
        } else {
            this.updateTargetRectId(targetRect, processedRect)
            this.updateTargetRectStatus(targetRect, processedRect)
        }
    }

    updateTargetRectId(targetRect, processedRect) {
        targetRect.id = processedRect.id
    }

    // 指定した矩形の登録ステータスを processedRect で更新
    updateTargetRectStatus(targetRect, processedRect) {
        targetRect.partNumberRegistered = processedRect.partNumberRegistered
        targetRect.transitionImageRegistered = processedRect.transitionImageRegistered
    }

    // rects から引数で指定した矩形を削除
    deleteTargetRect(targetRect) {
        this.rects = this.rects.filter(r => r !== targetRect)
    }

    // curPos と startPos から、矩形情報を計算する
    // x: ドラッグ開始点と現在点のうち、小さい方を x 座標とする
    // y: ドラッグ開始点と現在点のうち、小さい方を y 座標とする
    // width : 始点と現在点の差の絶対値の高さ
    // height: 始点と現在点の差の絶対値の幅
    calcCurrentRectPos(curPos) {
        return {
            x: Math.min(this.startPos.x, curPos.x),
            y: Math.min(this.startPos.y, curPos.y),
            width: Math.abs(curPos.x - this.startPos.x),
            height: Math.abs(curPos.y - this.startPos.y)
        }
    }

    // PC - 現在マウスの矢印の場所を取得
    getCurrentMousePos(e) {
        return {
            x: e.offsetX,
            y: e.offsetY
        }
    }

    // SP - 現在タッチしている場所を取得
    getCurrentTouchPos(e) {
        const touch = e.touches[0] // 最初のタッチポイントを取得
        return {
            x: touch.clientX - this.canvas.getBoundingClientRect().left,
            y: touch.clientY - this.canvas.getBoundingClientRect().top
        }
    }

    // 矩形描画開始時にステートセット
    setRectDrawState(curPos) {
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
        this.isDrawing = true
    }

    // 矩形描画終了時にステートをリセット
    resetRectDrawState() {
        this.startPos = null
        this.currentRect = null
        this.isDrawing = false
    }

    // 絶対座標を持つ rect に変換する
    // RectDrawer で利用
    convertToRectWithAbsolute(rect) {
        return {
            ...this.calcAbsoluteRectPos(rect),
            id: rect.id,
            partNumberRegistered: rect.partNumberRegistered,
            transitionImageRegistered: rect.transitionImageRegistered,
            deleted: false,
        }
    }

    // 相対座標を持つ rect に変換する
    // RectActionProcess で利用
    convertToRectWithRelative(rect) {
        return {
            ...rect,
            ...this.calcRelativeRectPos(rect),
            deleted: false,
        }
    }

    // 相対座標から矩形の絶対座標を算出する
    calcAbsoluteRectPos(relativeRect) {
        const absoluteX = this.imgPos.x + (relativeRect.x * this.imgPos.width)
        const absoluteY = this.imgPos.y + (relativeRect.y * this.imgPos.height)
        const absoluteWidth = relativeRect.width * this.imgPos.width
        const absoluteHeight = relativeRect.height * this.imgPos.height

        return {
            x: absoluteX,
            y: absoluteY,
            width: absoluteWidth,
            height: absoluteHeight
        }
    }

    // 矩形の絶対座標から相対座標を算出する
    // 相対座標は、0 ~ 1 (特に小数点以下は丸めていない)
    calcRelativeRectPos(rect) {
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
        return this.rects.some(rect => this.checkRectsOverlap(rect, this.currentRect))
    }

    checkRectsOverlap(rect1, rect2) {
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
    // Event Handler の中身
    //
    // 500ms をロングタップとして扱う
    setLongPressDetection(e) {
        this.longPressTriggered = false
        this.longPressTimer = setTimeout(async () => {
            this.longPressTriggered = true
            const curPos = this.getCurrentTouchPos(e)
            await this.processSelectedRect(curPos)
        }, 500)
    }

    updateRectDraw(curPos) {
        if (!this.isDrawing) return

        this.updateCanvas()

        // 現在ドラッグしている矩形を描画
        this.updateCurrentRect(curPos)
        this.drawCurrentRect()
    }

    finalizeRectDraw() {
        if (!this.isDrawing || !this.currentRect) return

        // 高さと幅が無い矩形は登録しない
        if (this.currentRect.width === 0 || this.currentRect.height === 0) {
            this.processRectDrawError(null)
            return
        }


        // 矩形が画像内にあるかチェック
        if (!this.checkWithinImage()) {
            this.processRectDrawError('画像の範囲外を選択しています！')
            return
        }

        // 矩形の重複チェック
        if (this.checkOverlap()) {
            this.processRectDrawError('描画範囲が重複しています！')
            return
        }

        this.addCurrentRect()
        this.updateCanvas()
        this.resetRectDrawState()
        console.log('新しい矩形描画後の矩形一覧', this.rects)
    }

    // onRectSelected をセットしていない場合、デフォルトのコンテキストメニューを表示し、
    // セットされている場合は、右クリック(ロングタップ)した場所にある矩形情報を取得し、onRectSelectedを呼び出す
    async processSelectedRect(curPos) {
        if (!this.onRectSelected) return

        const targetRect = this.findRectAtPosition(curPos)
        if (!targetRect) return

        // RectActionProcess で利用できる形に変換する
        const rectWithRelative = this.convertToRectWithRelative(targetRect)

        try {
            const processedRect = await this.onRectSelected(rectWithRelative)
            this.updateOrDeleteTargetRect(targetRect, processedRect)
            this.updateCanvas()
            console.log('登録 or 削除後の矩形一覧', this.rects)
        } catch (err) {
            console.error('部位番号の登録、遷移先画像の登録、削除のいずれかの失敗', err)
        }
    }

    // 矩形描画に失敗した時の後処理
    processRectDrawError(message) {
        if (message) alert(message)
        this.updateCanvas()
        this.resetRectDrawState()
    }
}
