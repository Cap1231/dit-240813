import { CanvasImageController } from "./services/canvasImageController.js";
import { ModalManager } from "./services/modalManager.js";

document.addEventListener('DOMContentLoaded', () => {
    const canvasImageController = new CanvasImageController('myCanvas', '../img/sample1.png');
    const modalManager = new ModalManager();

    canvasImageController.onRectSelected = (rect) => {
        modalManager.openActionStartModal(rect);
    };
});
