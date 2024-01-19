<template>

  <div v-if="control.visible" :class="styles.objectAddProps.root">

    <HeaderLine :input="input"/>
    <ItemList :input="input"/>

  </div>

</template>


<script setup lang="ts">
import {provide, ref, Ref} from "vue";
import {useJsonFormsControlWithDetail} from "@jsonforms/vue";
import {AdditionalPropertyType, createAdditionProperties} from "./AdditionalProperties/utils/additionalProperties";
import {type BopStyles, defaultStyles, useStyles} from "./composition";
import HeaderLine from "./AdditionalProperties/HeaderLine.vue";
import ItemList from "./AdditionalProperties/ItemList.vue";

const props = defineProps<{
  input: ReturnType<typeof useJsonFormsControlWithDetail>
}>();

const control = props.input.control;

const styles = useStyles(control.value.uischema, defaultStyles) as BopStyles;

const additionalPropertyItems: Ref<AdditionalPropertyType[]> = ref(createAdditionProperties(control.value.schema, control.value?.data, control.value.path));
provide("additionalPropertyItems", additionalPropertyItems)


</script>.value
