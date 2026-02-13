import { $, component$, useContext, useOnWindow } from "@builder.io/qwik";
import Vivus from "vivus";
import ModelContext from "~/context/file-context";

interface HeaderProps {
    bunny: string;
}

export default component$((props: HeaderProps) => {
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

    const sendTextData = $(async (text: string) => {
        modelStore.fileText = text;
    })

    const handleChange$ = $(async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;

        const text = await input.files[0].text();
        sendTextData(text);
    });


    return (
        <header class="h-20 p-4">
            <div class="flex flex-row items-center align-middle justify-between">
                <div class="scale-500 p-4">
                    <div id="logo-svg-div"></div>
                </div>

                <div class="flex flex-row gap-4">
                    <label
                        class="inline-block cursor-pointer rounded-lg bg-[#5C382C] py-3 px-6  text-gray-100 
                    font-semibold shadow-md transition hover:bg-[#825344] active:scale-90">
                        Upload .obj
                        <input
                            type="file"
                            accept=".obj"
                            class="hidden"
                            onChange$={handleChange$}
                        />
                    </label>

                    <label
                        onClick$={$(() => sendTextData(props.bunny))}
                        class="inline-block cursor-pointer rounded-lg bg-[#5C382C] py-3 px-6  text-gray-100 
                    font-semibold shadow-md transition hover:bg-[#825344] active:scale-90">
                        Render bunny
                    </label>
                </div>

            </div>
        </header>
    );
});