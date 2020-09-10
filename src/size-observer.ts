export interface Size {
    width: number;
    height: number;
}

export class SizeObserver {
    private raf: number | null = null;
    private currentSize: Size | null = null;
    private element: Element;
    private listeners: Set<(size: Size, prevSize: Size | null) => void> = new Set();

    public constructor(element: Element) {
        this.element = element;
    }

    private update = () => {
        const size = SizeObserver.getSize(this.element);
        if (this.currentSize === null || this.currentSize.width !== size.width || this.currentSize.height !== size.height) {
            const prevSize = this.currentSize;
            this.currentSize = size;
            this.fire('sizechange', size, prevSize);
        }

        this.raf = window.requestAnimationFrame(this.update);
    };

    private fire(event: 'sizechange', size: Size, prevSize: Size | null) {
        for (const listener of this.listeners) {
            listener(size, prevSize);
        }
    }

    public on(event: 'sizechange', handler: (size: Size, prevSize: Size | null) => void) {
        if (this.listeners.size <= 0) {
            this.update();
        }
        this.listeners.add(handler);
        handler(this.currentSize!, null);
        return this;
    }

    public off(event: 'sizechange', handler: (size: Size, prevSize: Size | null) => void) {
        this.listeners.delete(handler);
        if (this.listeners.size <= 0) {
            if (this.raf !== null) {
                window.cancelAnimationFrame(this.raf);
                this.raf = null;
            }
        }
        return this;
    }

    public static getSize(element: Element): Size {
        const bounds = element.getBoundingClientRect();
        return {
            width: bounds.width,
            height: bounds.height
        };
    }
}
