import { component$, Slot, useContextProvider, useStore, useStyles$ } from "@builder.io/qwik";
import Header from "../components/header";
import styles from "./styles.css?inline";
import ModelContext from "~/context/file-context";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useTextLoader = routeLoader$(async () => {
    const res = await fetch('https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/refs/heads/master/data/stanford-bunny.obj');
    const text = await res.text();
    return text;
});

export default component$(() => {
    useStyles$(styles);
    const modelStore = useStore({
        fileText: null,
    });

    const textLoader = useTextLoader();

    useContextProvider(ModelContext, modelStore);

    return (
        <div class="flex flex-col min-h-screen gap-8">
            <Header bunny={textLoader.value} />
            <main class="flex-1 flex h-full">
                <Slot />
            </main>
        </div>
    );
});
