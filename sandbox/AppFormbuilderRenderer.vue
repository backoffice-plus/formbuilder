<template>

  <div>

    <div class="container m-auto flex flex-col gap-4 ">

      <div class="card p-4">

        <div :class="'styleA'">
          <JsonForms
              :schema="formJson.schema"
              :uischema="formJson.uischema"
              :data="data"
              :renderers="jsonFormsRenderers"
              @change="onChange"
          />
        </div>

      </div>

      <div class="card">
        <textarea class="w-full aspect-video">{{newschema}}</textarea>
      </div>

    </div>
  </div>


</template>

<style scoped>

</style>

<script setup>
import {provide, ref} from "vue";
import formJson from "./jsonForms/examples/json/renderer-formbuilder.form.json";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import boplusVueVanillaRenderers from "@backoffice-plus/jsonforms-vue-vanilla";
import {formbuilderRenderers, defaultTools} from "../src";
import {JsonForms} from "@jsonforms/vue";

const data = ref({});
const newschema = ref({});

const onChange = (e) => {
  newschema.value = e;
};

const jsonFormsRenderers = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
  ...formbuilderRenderers,
]);
provide('formbuilder-tools', defaultTools)

</script>
