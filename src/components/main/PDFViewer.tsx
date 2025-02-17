"use client";

// Core viewer
import { pdfjs, Document, Page } from 'react-pdf';
import { useEffect, useState, type ReactNode } from 'react';
pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.mjs";

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"


interface PDFViewerProps {
    pdfUrl: string
    trigger: ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function PDFViewer({ pdfUrl, trigger, open, onOpenChange }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [_window, set_Window] = useState<Window | undefined>()

    useEffect(() => {
        set_Window(window)
    }, [set_Window]);



    useEffect(() => {
        const handleContextmenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextmenu);
        return function cleanup() {
            document.removeEventListener('contextmenu', handleContextmenu);
        };
    }, []);


    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
        setIsLoading(false)
    }

    function changePage(offset: number) {
        setPageNumber((prevPageNumber) => Math.min(Math.max(prevPageNumber + offset, 1), numPages || 1))
    }

    return (
        <Dialog open={open} onOpenChange={(open) => { if (!open) { setNumPages(null); setPageNumber(1); setIsLoading(true) } onOpenChange(open); }}>
            {trigger}
            <DialogContent className="max-w-4xl pb-2 pt-4 w-11/12 h-[99vh] overflow-hidden">
                <DialogHeader className='items-center'>
                    <DialogTitle>{'צפייה בדו"ח'}</DialogTitle>
                    {isLoading && (
                        <div className="flex items-center justify-center w-full h-full">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    )}

                </DialogHeader>

                <div className="flex-grow overflow-auto">
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<></>}
                        error={<div>{'שגיאה בטעינת הדו"ח'}</div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.min(_window?.innerWidth! * 0.8, 800)}
                        />
                    </Document>
                </div>
                {!isLoading && numPages && (
                    <div className="flex items-center justify-between w-full h-8 pt-2 border-t">
                        <Button onClick={() => changePage(-1)} disabled={pageNumber <= 1} variant="link" size="icon">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <p>
                            עמוד {pageNumber} מתוך {numPages}
                        </p>
                        <Button
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= (numPages || 1)}
                            variant="link"
                            size="icon"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )

}