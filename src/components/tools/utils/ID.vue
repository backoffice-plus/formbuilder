<template>

  <pre class="text-xs">{{ ids }}</pre>

</template>


<script setup>
import {computed, watch, ref} from "vue";

const props = defineProps({
  tool: Object,//ToolInterface
})

const edgeRef = ref(props.tool?.edge);
const schemaRef = ref(props.tool?.edge?.schemaParent);
const schemaIdRef = ref(props.tool?.edge?.schemaParent?.uuid);
const uiIdRef = ref(props.tool?.edge?.uiParent?.uuid);

const ids = computed(() => {

    const id = props.tool?.uuid;
    let schemaId = schemaIdRef.value;
    let uiId = uiIdRef.value;

    let ids = {
        id: getId(id),
    }

    if(uiId === schemaId && schemaId) {
        ids["schema===uiParent"] = getId(schemaId);
    }
    else {
        ids.schemaParent = getId(schemaId);
        ids.uiParent = getId(uiId);
    }

    return ids
})

const getId = (id) =>  {
    return id?.slice(-6);
}

</script>
