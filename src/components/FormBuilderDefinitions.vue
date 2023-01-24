<template>

  <div class="formBuilderDefinitions">

    <textarea class="w-full h-64">{{ props.definitions }}</textarea>

<!--    <JsonForms-->
<!--        :class="'styleA'"-->
<!--        :schema="schema"-->
<!--        :uischema="null"-->
<!--        :data="{root:jsonFormsData}"-->
<!--        :renderers="jsonFormRenderes"-->
<!--        :ajv="ajv"-->
<!--        @change="r => jsonFormsUpdated=r"-->
<!--    />-->

<!--    <div class="flex">-->
<!--      <textarea class="w-full h-64">{{ props.definitions }}</textarea>-->
<!--      <textarea class="w-full h-64">{{ jsonFormsData }}</textarea>-->
<!--      <textarea class="w-full h-64">{{jsonFormsUpdated?.data?.root }}</textarea>-->
<!--      <textarea class="w-full h-64">{{ }}</textarea>-->
<!--    </div>-->

  </div>

</template>

<style>

</style>


<script setup>
import {JsonForms} from "@jsonforms/vue";
import {createAjv} from "@jsonforms/core";
import {jsonFormRenderes} from "../../src/index";
import {schema} from "../schema/definitions";
import {computed, onMounted, ref} from "vue";

const props = defineProps({
  definitions: Object
})

//const jsonFormsData = computed(() => (props.definitions && normalizeDefinitions(props.definitions)) ?? {});
const jsonFormsData = [
  {
    "_key": "a",
    "type": "string"
  },
  {
    "_key": "b",
    "type": "string"
  }
];
const jsonFormsDataX = [
  // {
  //   "type": "object",
  //   "properties": [
  //     {
  //       "type": "string",
  //       "_key": "street_address"
  //     },
  //     {
  //       "type": "string",
  //       "_key": "city"
  //     },
  //     {
  //       "type": "string",
  //       "_key": "state"
  //     }
  //   ],
  //   "_key": "address"
  // },
  // {
  //   "type": "object",
  //   "properties": [
  //     {
  //       "type": "string",
  //       "_key": "name"
  //     },
  //     {
  //       "type": "string",
  //       "_key": "mail"
  //     }
  //   ],
  //   "_key": "user"
  // },
  // {
  //   "type": "array",
  //   "items": {
  //     "$ref": "#/definitions/user"
  //   },
  //   "_key": "users"
  // },
  // {
  //   "type": "array",
  //   "items": {
  //     "$ref": "#/definitions/address"
  //   },
  //   "_key": "addresses"
  // }
]

const jsonFormsUpdated = ref([]);
//const jsonFormsUpdatedDenorm = computed(() => (jsonFormsUpdated.value?.data?.root?.length && denormalizeDefinitions(jsonFormsUpdated.value.data.root)) ?? {});

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

</script>

