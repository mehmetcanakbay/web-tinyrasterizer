import { $, component$, useContext, useOnWindow } from "@builder.io/qwik";
import Vivus from "vivus";
import ModelContext from "~/context/file-context";
export default component$(() => {
    useOnWindow("load", $(() => {
        const myvivus = new Vivus(
            "logo-svg-div",
            {
                duration: 100,
                file: "/logo.svg",
                type: "oneByOne",
                delay: 50,
                animTimingFunction: Vivus.LINEAR,
            },
            () => { },
        );
        myvivus.stop().reset().play(2);
    }));

    const modelStore = useContext(ModelContext);
    const handleChange$ = $(async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;

        const text = await input.files[0].text();
        modelStore.fileText = text;
    });

    return (
        <header class="h-20 p-2">
            <div class="flex flex-row items-center align-middle justify-between">
                <div class="scale-100 -mt-12 p-4">
                    <div id="logo-svg-div"></div>
                </div>

                <div class="-mt-12">
                    <label
                        class="inline-block cursor-pointer rounded-lg bg-[#5C382C] py-3 px-6 mr-4 text-gray-100 
                    font-semibold shadow-md transition hover:bg-[#825344] active:scale-90">
                        Upload .obj
                        <input
                            type="file"
                            accept=".obj"
                            class="hidden"
                            onChange$={handleChange$}
                        />
                    </label>
                </div>
            </div>
        </header>
    );
});