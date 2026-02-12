import { component$, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from "@builder.io/qwik-city";
import ModelContext from '~/context/file-context';
import { render } from '~/lib/rasterizer/mainRasterizer';
import { parseOBJ } from '~/lib/rasterizer/objParser';

export default component$(() => {
    const canvasRef = useSignal<HTMLCanvasElement>();
    const modelStore = useContext(ModelContext);

    useTask$(({ track }) => {
        track(() => modelStore.fileText);

        if (!modelStore.fileText) return;
        const canvas = canvasRef.value;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const parsedObj = parseOBJ(modelStore.fileText);
        render(ctx, parsedObj, canvasRef?.value?.width, canvasRef.value?.height);
    });

    return (
        <div class="flex flex-col w-full h-[80vh]">
            <div class="flex-1 flex h-full w-full">
                <canvas
                    class="h-full aspect-square"
                    ref={canvasRef}
                />
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Web Tiny Rasterizer",
    meta: [
        {
            name: "description",
            content: "Web port of Tiny Rasterizer",
        },
    ],
};
