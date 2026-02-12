import { createContextId } from '@builder.io/qwik';

export interface ModelStore {
    fileText: string | null;
}

const ModelContext = createContextId<ModelStore>('model-context');

export default ModelContext;