import { component$, Slot, useContextProvider, useStore, useStyles$ } from "@builder.io/qwik";
import Header from "../components/header";
import styles from "./styles.css?inline";
import ModelContext from "~/context/file-context";

export default component$(() => {
    useStyles$(styles);
    const modelStore = useStore({
        fileText: null,
    });

    useContextProvider(ModelContext, modelStore);

    return (
        <div class="flex flex-col min-h-screen gap-4">
            <Header />
            <main class="flex-1 flex h-full">
                <Slot />
            </main>
        </div>
    );
});
