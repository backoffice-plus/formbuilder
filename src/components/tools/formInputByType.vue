<template>
  <div class="formInputByType">


    <ElementHeadOrToolIcon :uuid="uuid" :tool="tool" :toolProps="toolProps" :toolType="toolProps.toolType" :properties="data" />

<!--    <span class="font-mono text-xs" v-if="!tool">[{{ uuid }}]</span>-->

    <div v-if="!tool">

      <div>

        <template v-if="'select' === data.inputType">
          <select>
            <option v-for="item in data.enum" v-if="data.enum">{{ item }}</option>
            <option v-for="item in data.oneOf" v-else-if="data.oneOf">{{ item }}</option>
          </select>
        </template>


        <template v-else-if="'radio' === data.inputType">
          <div class="flex flex-row space-x-4">
            <span v-for="item in data.enum">
              <input name="propertyName" :type="data.inputType"/> {{ item }}
            </span>
          </div>
        </template>

        <template v-else-if="'textarea' === data.inputType">
          <textarea></textarea>
        </template>

        <template v-else>
          <input :type="data.inputType"  />
        </template>

        <div>{{ data.description }}</div>

        <Actions :uuid="uuid" @gear="openModal" @delete="onDelete" />

      </div>

    </div>

  </div>
</template>


<style scoped>
.formInputByType {
  @apply
  relative
}
</style>

<script>

import {
  ElementHeadOrToolIcon, Actions,
  ToolProps,
  updatableSchemaKeys, updatableUischemaKeys,
  emitter
} from "../../index";
import {defineComponent} from 'vue';

export default defineComponent({
  components: {ElementHeadOrToolIcon, Actions},
  props: {
    toolProps: ToolProps,
    uuid: String,
    tool: Boolean,
    index: Number, //for deleting correct element in list

    isDragging: Boolean, //needed in flexarea
  },
  // props: [
  //     'name', 'inputType', 'propertyName', 'uuid', 'jsonForms', 'options'
  // ],

  data() {
    return {

      data: {},
      isModalOpen: false,
    }
  },

  mounted() {
    if(this.tool) {
      return;
    }

    this.data.inputType = this.toolProps.inputType;
    this.data.propertyName = this.toolProps.propertyName;

    const schema = this.toolProps.jsonForms.schema;
    if(schema.oneOf !== undefined && !schema.oneOf.length) {
      this.toolProps.jsonForms.schema.oneOf = [{}]
    }
    if(schema.enum !== undefined && !schema.enum.length) {
      this.toolProps.jsonForms.schema.enum = ['']
    }

    updatableSchemaKeys.forEach(key => {
      if(this.toolProps.jsonForms.schema[key]) {
        this.data[key] = this.toolProps.jsonForms.schema[key];
      }
    });
    updatableUischemaKeys.forEach(key => {
      if(this.toolProps.jsonForms.uischema[key]) {
        this.data[key] = this.toolProps.jsonForms.uischema[key];
      }
    });


    console.log("mounted",this.toolProps.jsonForms.schema);
  },

  methods: {
    onDelete() {
      if(confirm("Wirklich löschen?")) {
        this.$emit('deleteByIndex', {index: this.index});
      }
    },
    openModal() {
      console.log("openModal emit");
      emitter.emit('formBuilderModal', {uuid:this.uuid, data:this.data, type:this.toolProps.jsonForms.uischema?.type})
    },
  },

  watch: {
    data: {
      handler() {
        this.toolProps.jsonForms.update({...this.data});
        emitter.emit('formBuilderUpdated')
      },
      deep: true
    },
  }
});
</script>
