import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from "@builder.io/qwik-city";
import { render } from '~/lib/rasterizer/mainRasterizer';
import { parseOBJ } from '~/lib/rasterizer/objParser';

export default component$(() => {
    const inputFileElement = useSignal<HTMLInputElement>();
    const canvasRef = useSignal<HTMLCanvasElement>();

    useVisibleTask$(() => {
        const canvas = canvasRef.value;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const input = inputFileElement.value;
        if (!input) return;

        const handleChange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files?.length) return;

            const fileData = target.files[0];
            const fileText = await fileData.text();

            const parsedObj = parseOBJ(fileText);
            render(ctx, parsedObj);
        };

        input.addEventListener('change', handleChange);

        return () => {
            input.removeEventListener('change', handleChange);
        };
    });

    return (
        <>
            <input
                type="file"
                accept=".obj"
                class="px-4 bg-red-400"
                ref={inputFileElement}
            />

            <canvas
                width={800}
                height={800}
                ref={canvasRef}
            />
        </>
    );
    1
});


export const head: DocumentHead = {
    title: "Welcome to Qwik",
    meta: [
        {
            name: "description",
            content: "Qwik site description",
        },
    ],
};
