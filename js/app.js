import { CanvasImageController } from "./services/canvasImageController.js";

document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new CanvasImageController('myCanvas', '../img/sample1.png');
});
