document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // キャンバスサイズを動的に設定
    canvas.width = window.innerWidth * 0.8; // 画面の幅の80%
    canvas.height = window.innerHeight * 0.8; // 画面の高さの80%

    img.onload = () => {
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
    };

    // TODO: 画像は適当に指定しているので変更してください
    img.src = '../img/sample1.png';
});
