/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// Function to load and render PDF
async function renderPDF(pdfUrl, canvasId) {
    const pdf = await getDocument(pdfUrl).promise; // Load the PDF document
    const page = await pdf.getPage(1); // Get the first page of the PDF

    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');

    const viewport = page.getViewport({ scale: 1.5 }); // Adjust the scale if needed
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };

    await page.render(renderContext).promise;
}

// Call the function to render
const pdfUrl = 'test.pdf'; // Replace with your PDF path
renderPDF(pdfUrl, 'pdf-canvas');