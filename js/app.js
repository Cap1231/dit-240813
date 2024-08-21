import { RectDrawer } from "./services/rectDrawer.js"
import { RectActionProcess } from "./services/rectActionProcess.js"

document.addEventListener('DOMContentLoaded', () => {
    const existingRects = [{ x: 0.1, y: 0.2, width: 0.2, height: 0.5 }, { x: 0.6, y: 0.8, width: 0.1, height: 0.2 }];

    const rectDrawer = new RectDrawer('myCanvas', '../img/sample1.png', existingRects)
    const rectActionProcess = new RectActionProcess()

    rectDrawer.onRectSelected = async (rect) => {
        const processedRect = await rectActionProcess.start(rect)
        return processedRect
    }
})
