<template>

    <pre class="text-xs"><span :style="'background-color:#'+getId(tool.uuid)">{{ getId(tool.uuid) }}</span></pre>
    <div v-for="child in childs" v-if="childs" class="ml-4">
        <IdList :tool="child" v-if="child.uuid"/>
    </div>

</template>

<style scoped>
pre span {
    color:white;;
    text-shadow: 1px 1px #000;
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
