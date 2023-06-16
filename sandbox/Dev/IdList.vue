<template>

    <pre class="text-xs whitespace-nowrap">

        <span :style="'background-color:#'+getId(tool.uuid)" title="tool id"> {{ getId(tool.uuid) }}</span>

        <dfn :title="tool.propertyName">{{ tool.constructor.name }}</dfn>

        <span :style="'background-color:#'+getId(tool.edge.schemaParent?.uuid)" title="schema parent id">{{ getId(tool.edge.schemaParent?.uuid) ?? "[]" }}</span>
        <span :style="'background-color:#'+getId(tool.edge.uiParent?.uuid)" title="ui parent id">{{ getId(tool.edge.uiParent?.uuid) ?? "[]" }}</span>

    </pre>
    <ul v-for="(child,k,i) in childs" v-if="childs" class="ml-4 font-mono">
        <li class="list-disc">
            <IdList :tool="child" v-if="child.uuid"/>
        </li>
    </ul>

</template>

<style scoped>
pre span {
    color:white;;
    text-shadow: 1px 1px #000;
}
dfn, span {
    @apply
    cursor-help
}dfn {
     color:unset
 }
</style>

<script setup>
import {computed} from "vue";

const props = defineProps({
    tool: Object,//ToolInterface
})
const childs = computed(() => props.tool.edge.childs);

const getId = (id) => {
    return id?.slice(-6);
}

</script>
