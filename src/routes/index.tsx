import { component$, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from "@builder.io/qwik-city";
import ModelContext from '~/context/file-context';
import { render } from '~/lib/rasterizer/mainRasterizer';
import { Vector3 } from '~/lib/rasterizer/math';
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
        // render(ctx, parsedObj, canvasRef?.value?.width, canvasRef.value?.height, new Vector3(3, -0.2, -3.0), Vector3.zero(), new Vector3(3, 3, 3));
        render(ctx, parsedObj, canvasRef?.value?.width, canvasRef.value?.height, Vector3.zero(), Vector3.zero(), new Vector3(2, 2, 2));
    });

    return (
        <div class="flex flex-col w-full h-[80vh] items-center">
            <div class="flex-1 flex flex-row h-full w-full justify-center">
                <canvas
                    class="h-full aspect-square rounded-lg justify-center"
                    width={800}
                    height={800}
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
