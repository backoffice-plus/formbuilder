import {ref} from "vue";

export const buttonRegistry = ref(new Map<string,()=>void>);
