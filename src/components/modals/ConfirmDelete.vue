
<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import type {ToolInterface} from "../../lib/models";
import {getFormbuilder} from "../../lib/vue";

const props = defineProps<{
    tool: ToolInterface
}>()
const emit = defineEmits<{
    (e: 'confirm'): void,
    (e: 'unscope'): void,
}>()

const fb = getFormbuilder();
const hasSchemaParent = props.tool.edge.schemaParent;
const hasUiParent = props.tool.edge.uiParent;
const isUiBuilder = 'uischema' === fb?.exposed?.showBuilder?.value;

const unscopable = hasUiParent && hasSchemaParent && isUiBuilder;

const isControl = 'Control' === props.tool?.uischema?.type;
const scopedChilds = props.tool.edge.findScopedChilds();

</script>

<template>
    <VueFinalModal
            class="flex justify-center items-center"
            content-class="flex flex-col max-w-xl mx-4 p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg space-y-2"
    >
        <h1 class="text-xl">
            Confirm deletion
        </h1>
        <slot />
        <div class="flex">
            <button class="mt-1 ml-auto px-2 border rounded-lg bg-yellow-500" @click="emit('unscope')" v-if="unscopable">
                just unscope
            </button>
            <button class="mt-1 ml-auto px-2 border rounded-lg bg-red-500" @click="emit('confirm')">
                Confirm
            </button>
        </div>
        <div v-if="scopedChilds.length && !isControl">
            {{ scopedChilds.length }} Childs are only unscoped:
            <div v-for="child in scopedChilds">
                {{ child.propertyName }}
            </div>
        </div>
        <div v-if="tool.edge.childs.length && isControl">
            {{ tool.edge.childs.length }} Childs are deleted as well
        </div>
    </VueFinalModal>
</template>
