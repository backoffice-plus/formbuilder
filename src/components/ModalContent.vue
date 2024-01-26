<template>

    <section class="p-4 ">

      <h2>Optionen</h2>

      <!--
      :TODO how to change class from jsonForms?
      -->
<!--      options: {{ options }}-->
      <div class="styleA">
        <JsonForms
            :schema="jsonFormSchema?.schema"
            :uischema="jsonFormSchema?.uischema"
            :data="options"
            :renderers="mergedJsonFormsRenderers"
            :ajv="ajv"
            :i18n="{translate: createI18nTranslate(formBuilderCatalogue)}"
            @change="onChange"
            v-if="jsonFormSchema?.schema"
        />
      </div>

      <div v-if="error" class="errorMsg">{{error}}</div>
      <div v-if="errorAfterUpdated" class="flex flex-col gap-1">
        <div v-for="e in errorAfterUpdated" class="errorMsg px-1">{{ e.instancePath }}: {{e.message}}</div>
      </div>

<!--      Data: {{ dataAfterUpdated }}-->

<!--      <div class="mt-4 flex justify-center">-->
<!--        <button class="button blue">Submit</button>-->
<!--      </div>-->

    </section>

</template>



<style scoped>
.errorMsg {
  color: var(--error);
}
</style>



<script setup>
import {onMounted, ref} from "vue";
import {JsonForms} from "@jsonforms/vue";
import {createAjv} from "@jsonforms/core";
import {formBuilderCatalogue} from "@/translations/de";
import {createI18nTranslate, getFormbuilder} from "@/";

const props = defineProps({
  tool: Object,//ToolInterface,
  data: Object,
  jsonFormsRenderers: Array,
})
const emit = defineEmits(['change']);

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

const options = ref({});
const jsonFormSchema = ref({});
const dataAfterUpdated = ref({});
const errorAfterUpdated = ref([]);
const mergedJsonFormsRenderers = ref(Object.freeze(props.jsonFormsRenderers));
const error = ref('');

const fb = getFormbuilder();

onMounted(async () => {

  const context = {
    fb: fb,
    builder: fb?.exposed?.showBuilder.value,
    schemaOnly: fb.props.schemaOnly,
    schemaReadOnly: fb.props.schemaReadOnly,
    rootSchema: fb?.exposed?.rootSchema?.value,
    baseSchemaTool: fb?.exposed?.baseSchemaTool?.value,
  }

  try {
  options.value = props.tool.optionDataPrepare(context);
  jsonFormSchema.value = await props.tool.optionJsonforms(context)
      .then(e => {
        const event = {
          tool:props.tool,
          schema: JSON.parse(JSON.stringify(e.schema)),
          uischema: JSON.parse(JSON.stringify(e.uischema)),
        };

        return {schema:event.schema, uischema:event.uischema};
    })
    .catch(e => {
      error.value = e
    })
  }
  catch(e) {
    error.value = e;
  }




  /**
   * :TODO this can probably removed (all renderer should be registered at the init of jsonforms)
   */
    if(props.tool.optionJsonformsRenderer) {
      const renderer = props.tool.optionJsonformsRenderer();
      if(renderer?.length) {
        mergedJsonFormsRenderers.value = Object.freeze([
            ...mergedJsonFormsRenderers.value,
            ...renderer,
        ])
      }
    }

})

const onChange = (e) => {
  errorAfterUpdated.value = [];
  dataAfterUpdated.value = {};

  if(e.errors.length) {
    console.warn("ModalOption", "errors at onChange", e.errors, e.data);
    errorAfterUpdated.value = e.errors;
  }
  else {
    //const data = {...e.data};//:TODO deep copy
    const data = JSON.parse(JSON.stringify(e.data)); //:TODO other way to remove ref/proxy?
    dataAfterUpdated.value = data;

    const context = {
      fb:fb,
      parentMethod:'modalcontent.onchange',
      builder: fb?.exposed?.showBuilder?.value,
      schemaReadOnly: fb.props.schemaReadOnly,
    }
    props.tool.optionDataUpdate(context, data)

    emit('change', data);
  }
}

</script>
