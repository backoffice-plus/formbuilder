<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

      <FormBuilder />

      <FormBuilderDetails />

  </div>

</template>

<script setup lang="ts">
import {FormBuilder, FormBuilderDetails} from "../src/index.ts";
</script>


<style>
body {
  background-color: #f3f4f5;
}

.card {
  @apply
  bg-white rounded shadow
}
</style>
