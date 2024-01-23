<template>
  <div v-if="control.visible">

    <DispatchRendererSloted
        :visible="control.visible"
        :enabled="control.enabled"
        :schema="control.schema"
        :uischema="detailUiSchema"
        :path="control.path"
        :renderers="control.renderers"
        :cells="control.cells"
    >

      <template #header="{label}">
        <div class="flex justify-between">
          {{ label }}
          <ButtonWithDialog :input="input"/>
        </div>
      </template>

      <ItemList
          v-if="showAdditionalProperties"
          :input="input"
      />

    </DispatchRendererSloted>


  </div>
</template>

<script lang="ts">
import {defineComponent, provide, ref, type Ref} from 'vue';
import {Generate, findUISchema, isObjectControl, rankWith, and, schemaMatches} from '@jsonforms/core';
import {rendererProps, useJsonFormsControlWithDetail, type RendererProps} from '@jsonforms/vue';
import {useVanillaControl} from '@jsonforms/vue-vanilla';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import {useNested} from "./composition";
import type {ControlElement, GroupLayout, JsonFormsRendererRegistryEntry, UISchemaElement,} from '@jsonforms/core';
import AdditionalProperties2 from "./AdditionalProperties2.vue";
import HeaderLine from "./AdditionalProperties/HeaderLine.vue";
import {type AdditionalPropertyType, createAdditionProperties} from "./AdditionalProperties/utils/additionalProperties";
import ItemList from "./AdditionalProperties/ItemList.vue";
import ButtonWithDialog from "./AdditionalProperties/ButtonWithDialog.vue";
import DispatchRendererSloted from "./DispatchRendererSloted.vue";

const controlRenderer = defineComponent({
  name: 'ObjectRenderer',
  components: {
    DispatchRendererSloted,
    ButtonWithDialog,
    ItemList,
    HeaderLine,
    AdditionalProperties2,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useVanillaControl(useJsonFormsControlWithDetail(props));
    const nested = useNested('object');

    const additionalPropertyItems: Ref<AdditionalPropertyType[]> = ref(createAdditionProperties(control.control.value.schema, control.control.value?.data, control.control.value.path));
    provide("additionalPropertyItems", additionalPropertyItems)

    console.log("additionalPropertyItems", {schema:control.control.value.schema, data:control.control.value?.data, additionalPropertyItems:additionalPropertyItems.value})

    return {
      ...control,
      input: control,
      nested,
    };
  },
  computed: {
    showAdditionalProperties(): boolean {
      const showAdditionalProperties =  this.control.uischema.options?.showAdditionalProperties;
      return (
          showAdditionalProperties === undefined ||
          showAdditionalProperties === true
      );
    },
    detailUiSchema(): UISchemaElement {
      const uiSchemaGenerator = () => {
        const uiSchema = Generate.uiSchema(this.control.schema, 'GroupSloted');
        if (isEmpty(this.control.path)) {
          uiSchema.type = 'VerticalLayout';
        } else {
          (uiSchema as GroupLayout).label = this.control.label;
        }
        return uiSchema;
      };

      let result = findUISchema(
          this.control.uischemas,
          this.control.schema,
          this.control.uischema.scope,
          this.control.path,
          uiSchemaGenerator,
          this.control.uischema,
          this.control.rootSchema
      );


      if (this.nested.level > 0) {
        result = cloneDeep(result);
        result.options = {
          ...result.options,
          bare: true,
          alignLeft:
              this.nested.level >= 4 || this.nested.parentElement === 'array',
        };
      }

      return result;
    },
  },
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, and(isObjectControl, schemaMatches((schema)=> {
    // do not support - additionalProperties === true - since then the type should be any and we won't know what kind of renderer we should use for new properties
    return !isEmpty(schema.patternProperties) || isObject(schema.additionalProperties)
  }))),
};
</script>
