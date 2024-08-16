import { CanvasImageController } from "./services/canvasImageController.js";
import { ImagePartRegistrationProcess } from "./services/imagePartRegistrationProcess.js";

document.addEventListener('DOMContentLoaded', () => {
    const canvasImageController = new CanvasImageController('myCanvas', '../img/sample1.png');
    const imagePartRegistrationProcess = new ImagePartRegistrationProcess();

    canvasImageController.onRectSelected = async (rect) => {
        const processedRect = await imagePartRegistrationProcess.start(rect)
        return processedRect
    };
});
