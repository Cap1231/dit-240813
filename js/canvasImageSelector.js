// TODO: 別ファイルに切り出す
//
// 描画する前のCanvas準備
//
// Canvasサイズを動的に設定
const resizeCanvas = (canvas) => {
    canvas.width = window.innerWidth * 0.8; // 画面の幅の80%
    canvas.height = window.innerHeight * 0.8; // 画面の高さの80%
}
// Canvasに画像を読み込み
const drawImageOnCanvas = (ctx, img) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // アスペクト比を保持しながらサイズを最大限に調整
    const ratio = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    const newWidth = Math.round(img.width * ratio);
    const newHeight = Math.round(img.height * ratio);

    // イメージをキャンバスの中央に配置
    const xOffset = Math.round((canvasWidth - newWidth) / 2);
    const yOffset = Math.round((canvasHeight - newHeight) / 2);

    ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
}
// Canvasクリア
const clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

//
// 矩形描画
//
const drawRectangle = (ctx, rect) => {
    ctx.strokeStyle = '#FF0000';
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

const drawDraggedRectangle = (ctx, rect) => {
    drawRectangle(ctx, rect);
}

const drawRectangles = (ctx, rectangles) => {
    rectangles.forEach(rect => {
        drawRectangle(ctx, rect)
    });
}

// 新しい矩形が既存のいずれかの矩形と重複していないか確認
const checkOverlap = (rectangles, newRect) => {
    for (const rect of rectangles) {
        if (rectanglesOverlap(rect, newRect)) {
            return true;
        }
    }
    return false;
}

// ２つの矩形の重複確認
const rectanglesOverlap = (rect1, rect2) => {
    return !(rect2.x > rect1.x + rect1.width ||
        rect2.x + rect2.width < rect1.x ||
        rect2.y > rect1.y + rect1.height ||
        rect2.y + rect2.height < rect1.y);
}


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // TODO: 画像は適当に指定しているので変更してください
    img.src = '../img/sample1.png';

    img.onload = () => {
        resizeCanvas(canvas)
        drawImageOnCanvas(ctx, img)
    };

    let startX, startY, isDragging = false;
    const rectangles = [];
    let currentRect = null;

    canvas.addEventListener('mousedown', (e) => {
        startX = e.offsetX;
        startY = e.offsetY;
        isDragging = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        clearCanvas(ctx)
        drawImageOnCanvas(ctx, img);
        drawRectangles(ctx, rectangles); // 重複がある場合は、既存の矩形のみを再描画

        // 現在ドラッグしている矩形を描画
        currentRect = {
            x: Math.min(startX, e.offsetX), // ドラッグ開始点と現在点のうち、小さい方を x 座標とする
            y: Math.min(startY, e.offsetY), // 同様に y 座標も定義
            width: Math.abs(e.offsetX - startX), // 幅は始点と現在点の差の絶対値
            height: Math.abs(e.offsetY - startY) // 高さも同様
        };
        drawDraggedRectangle(ctx, currentRect)
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        if (!currentRect) return;

        const isOverlapped = checkOverlap(rectangles, currentRect);

        if (isOverlapped) {
            // 重複がある場合は、既存の矩形のみを再描画
            alert('Error: Rectangles cannot overlap!');
        } else {
            // 重複がない場合は、既存の矩形＋新規矩形を描画
            rectangles.push(currentRect);
        }

        clearCanvas(ctx)
        drawImageOnCanvas(ctx, img);
        drawRectangles(ctx, rectangles);
        console.log(rectangles) // TODO: Delete.
        currentRect = null;
        isDragging = false;
    });
});
