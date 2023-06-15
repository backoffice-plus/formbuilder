<template>

    <pre class="text-xs"><span :style="'background-color:#'+getId(tool.uuid)">{{ getId(tool.uuid) }}</span> {{ tool.constructor.name }}</pre>
    <div v-for="(child,k,i) in childs" v-if="childs" class="ml-4 flex font-mono">
        <IdList :tool="child" v-if="child.uuid"/>
    </div>

</template>

<style scoped>
pre span {
    color:white;;
    text-shadow: 1px 1px #000;
}
div:not(:last-child)::before {
    content: '├─';
}
div:last-child::before {
    content: '└─';
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
