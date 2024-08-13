// TODO: 別ファイルに切り出す
const drawImageOnCanvas = (canvas, ctx, img) => {
    // キャンバスサイズを動的に設定
    canvas.width = window.innerWidth * 0.8; // 画面の幅の80%
    canvas.height = window.innerHeight * 0.8; // 画面の高さの80%

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // アスペクト比を保持しながらサイズを最大限に調整
    const ratio = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    const newWidth = Math.round(img.width * ratio);
    const newHeight = Math.round(img.height * ratio);

    // イメージをキャンバスの中央に配置
    const xOffset = Math.round((canvasWidth - newWidth) / 2);
    const yOffset = Math.round((canvasHeight - newHeight) / 2);

    ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
}

// ２つの図形の重複確認
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
        drawImageOnCanvas(canvas, ctx, img)
    };

    let startX, startY, isDragging = false;
    const rectangles = [];

    canvas.addEventListener('mousedown', (e) => {
        startX = e.offsetX;
        startY = e.offsetY;
        isDragging = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawImageOnCanvas(canvas, ctx, img);
        // 保存されている全矩形を再描画
        rectangles.forEach(rect => {
            ctx.strokeStyle = '#FF0000';
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });
        // 現在の矩形を描画
        const width = e.offsetX - startX;
        const height = e.offsetY - startY;
        ctx.strokeStyle = '#FF0000';
        ctx.strokeRect(startX, startY, width, height);
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        const width = Math.abs(e.offsetX - startX);
        const height = Math.abs(e.offsetY - startY);
        const x = Math.min(startX, e.offsetX);
        const y = Math.min(startY, e.offsetY);
        const newRect = { x: x, y: y, width: width, height: height };

        let overlap = false;
        for (const rect of rectangles) {
            if (rectanglesOverlap(rect, newRect)) {
                overlap = true;
                break;
            }
        }

        if (overlap) {
            alert('Error: Rectangles cannot overlap!');
            // 重複がある場合は、ここで処理を中断し、キャンバスをリセットして既存の矩形のみを再描画
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawImageOnCanvas(canvas, ctx, img);
            rectangles.forEach(rect => {
                ctx.strokeStyle = '#FF0000';
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            });
            isDragging = false;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawImageOnCanvas(canvas, ctx, img);
        rectangles.push(newRect); // 矩形を配列に追加
        rectangles.forEach(rect => {
            ctx.strokeStyle = '#FF0000';
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });
        isDragging = false;
    });
});
