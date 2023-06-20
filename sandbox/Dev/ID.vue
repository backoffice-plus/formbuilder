<template>

    <div>
        <div v-if="ids.id">
            <pre>ID: <span :style="bgColor(ids.id)">{{ ids.id }}</span></pre>
        </div>
        <div v-if="ids.schemaParent">
            <pre>schemaParent: <span :style="bgColor(ids.schemaParent)">{{ ids.schemaParent }}</span></pre>
        </div>
        <div v-if="ids.uiParent">
            <pre>uiParent: <span :style="bgColor(ids.uiParent)">{{ids.uiParent}}</span></pre>
        </div>
        <div v-if="ids.schemaAndUiParent">
            <pre>schema===uiParent: <span :style="bgColor(ids.schemaAndUiParent)">{{ ids.schemaAndUiParent }}</span></pre>
        </div>
    </div>

</template>

<style scoped>
pre {
    @apply text-xs
}
pre span {
    color: white;
    text-shadow: 1px 1px #000;
    @apply text-xs

}
</style>

<script setup>
import {nextTick, onMounted, ref} from "vue";

/**
 * :INFO add it to ToolIcon after droparea slot!!!
 */
const props = defineProps({
    tool: Object,//ToolInterface
})

const ids = ref({});

const getHex = (id) => id?.slice(-6);
const getIds = () => {
    const id = props.tool?.uuid;
    const schemaId = props.tool?.edge?.schemaParent?.uuid;
    const uiId = props.tool?.edge?.uiParent?.uuid;

    let ids = {
        id: getHex(id),
    }

    if (uiId === schemaId && schemaId) {
        ids.schemaAndUiParent = getHex(schemaId);
    } else {
        ids.schemaParent = getHex(schemaId);
        ids.uiParent = getHex(uiId);
    }

    return ids
};
const bgColor = (hex) => 'background-color:#'+hex;

onMounted(() => {
    nextTick().then(() => ids.value = getIds());
})

</script>
