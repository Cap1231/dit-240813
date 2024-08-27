import { RectDrawer } from "./services/rectDrawer.js"
import { RectActionProcess } from "./services/rectActionProcess.js"

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // TODO: 適当なJsonデータ読み込んでので、置き換えてください
        const resp = await fetch('../json/rects.json')
        const rects = await resp.json()

        const rectDrawer = new RectDrawer('rect-draw-canvas', '../img/sample1.png', rects)
        const rectActionProcess = new RectActionProcess()

        rectDrawer.onRectSelected = async (rect) => {
            const processedRect = await rectActionProcess.start(rect)
            return processedRect
        }
    } catch (err) {
        console.error('Failed to fetch rectangles:', err)
    }

})
