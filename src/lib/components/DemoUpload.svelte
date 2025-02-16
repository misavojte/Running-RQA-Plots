<script lang="ts">
    import type { Fixation } from "$lib/types/Fixation.js";
    import { handleFileUpload } from '$lib/utils/csvUtils.js';
    import { fade } from 'svelte/transition';

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    let { fixationGroups = $bindable([]) } = $props<{
        fixationGroups?: FixationGroup[];
    }>();

    let fileInput: HTMLInputElement;
    let isDragging = $state(false);
    let isUploading = $state(false);

    const handleFiles = async () => {
        if (!fileInput.files?.length) return;
        
        isUploading = true;
        try {
            const newFixationGroups = await handleFileUpload(fileInput.files);
            fixationGroups = newFixationGroups;
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files. Please check the console for details.');
        } finally {
            isUploading = false;
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        isDragging = true;
    };

    const handleDragLeave = () => {
        isDragging = false;
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        isDragging = false;
        
        if (e.dataTransfer?.files) {
            fileInput.files = e.dataTransfer.files;
            handleFiles();
        }
    };
</script>

<div class="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
    <div
        class="w-full my-4 p-6 rounded-lg border-2 border-dashed transition-colors duration-200 
            {isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}"
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
    >
        <div class="text-center">
            <svg 
                class="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
            >
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
            </svg>
            
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-900">
                    <span class="text-blue-600 font-semibold">Upload CSV files</span>
                    <span class="text-gray-500"> or drag and drop</span>
                    <input
                        bind:this={fileInput}
                        type="file"
                        accept=".csv"
                        multiple
                        onchange={handleFiles}
                        class="hidden"
                    />
                </label>
                <p class="mt-1 text-xs text-gray-500">
                    Multiple CSV files supported, one per participant
                </p>
            </div>
        </div>

        {#if isUploading}
            <div class="mt-4 text-center" transition:fade>
                <div class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span class="ml-2 text-sm text-gray-600">Uploading files...</span>
            </div>
        {/if}
    </div>

    <div class="w-full px-4 max-w-lg mx-auto">
        <p class="text-sm text-gray-600">
            <span class="font-medium">Required CSV format:</span> 
            <br>
            • Columns for <code class="px-1 py-0.5 bg-gray-100 rounded">timestamp</code> and <code class="px-1 py-0.5 bg-gray-100 rounded">aoi</code>
            <br>
            • Multiple AOIs can be separated by semicolons
            <br>
            • Optional columns for <code class="px-1 py-0.5 bg-gray-100 rounded">x</code> and <code class="px-1 py-0.5 bg-gray-100 rounded">y</code> coordinates
        </p>
    </div>
</div>