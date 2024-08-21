import { RectDrawer } from "./services/rectDrawer.js"
import { RectActionProcess } from "./services/rectActionProcess.js"

document.addEventListener('DOMContentLoaded', () => {
    const rectDrawer = new RectDrawer('myCanvas', '../img/sample1.png')
    const rectActionProcess = new RectActionProcess()

    rectDrawer.onRectSelected = async (rect) => {
        const processedRect = await rectActionProcess.start(rect)
        return processedRect
    }
})
