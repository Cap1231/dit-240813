import { CanvasImageController } from "./services/canvasImageController.js";

document.addEventListener('DOMContentLoaded', () => {
    const canvasImageController = new CanvasImageController('myCanvas', '../img/sample1.png');
    canvasImageController.onRectSelected = (rect) => {
        console.log(`Rectangle: ${rect.x}, ${rect.y}, ${rect.width}, ${rect.height}`)
        // modalManager.openModal(`Rectangle: ${rect.x}, ${rect.y}, ${rect.width}, ${rect.height}`);
    };
});
