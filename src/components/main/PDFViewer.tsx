"use client";

// Core viewer
import { pdfjs, Document, Page } from 'react-pdf';
import { useEffect, useState, type ReactNode } from 'react';
pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.mjs";

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface PDFViewerProps {
    pdfUrl: string
    fileName: string
    trigger: ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function PDFViewer({ pdfUrl, fileName, trigger, open, onOpenChange }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [_window, set_Window] = useState<Window | undefined>()

    useEffect(() => {
        set_Window(window)
    }, [])

    useEffect(() => {
        const handleContextmenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextmenu);
        return () => document.removeEventListener('contextmenu', handleContextmenu);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(open) => { 
            if (!open) { setNumPages(null); setIsLoading(true) } 
            onOpenChange(open); 
        }}>
            {trigger}
            <DialogContent className="max-w-4xl pb-2 pt-4 w-11/12 h-[99vh] overflow-hidden">
                <DialogHeader className="flex flex-col space-y-1.5 items-center">
                    <DialogTitle>{'צפייה בדו"ח'}</DialogTitle>
                    {isLoading && (
                        <div className="flex items-center justify-center w-full h-full">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    )}
                    <DialogDescription>
                        {fileName}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-grow h-full overflow-auto px-4">
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<></>}
                        error={<div>{'שגיאה בטעינת הדו"ח'}</div>}
                    >
                        {numPages &&
                            Array.from(new Array(numPages), (_, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    width={Math.min(_window?.innerWidth! * 0.8, 800)}
                                    className="mb-4"
                                />
                            ))}
                    </Document>
                </div>
            </DialogContent>
        </Dialog>
    )
}
