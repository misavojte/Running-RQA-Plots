import type { Fixation } from '../types/Fixation.js';

interface FixationGroup {
    label: string;
    fixations: Fixation[];
}


export const parseCSVFile = async (file: File): Promise<FixationGroup> => {
    const text = await file.text();
    const lines = text.split('\n');
    
    // Remove empty lines and trim whitespace
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // Assuming first line is header
    const header = nonEmptyLines[0].toLowerCase().split(',');
    
    // Find column indices (x and y are optional)
    const timestampIndex = header.findIndex(col => col.includes('timestamp'));
    const aoiIndex = header.findIndex(col => col.includes('aoi'));
    const xIndex = header.findIndex(col => col.includes('x'));
    const yIndex = header.findIndex(col => col.includes('y'));
    
    if (timestampIndex === -1 || aoiIndex === -1) {
        throw new Error('CSV must contain columns for timestamp and aoi');
    }

    // Parse data rows
    const fixations: Fixation[] = nonEmptyLines.slice(1).map((line, index) => {
        const columns = line.split(',');
        
        // Handle multiple AOIs separated by semicolon
        const aois = columns[aoiIndex].split(';').map(aoi => aoi.trim());
        
        // Create base fixation object
        const fixation: Fixation = {
            id: index + 1, // Assign a unique id based on the index
            timestamp: parseInt(columns[timestampIndex]),
            aoi: aois
        };

        // Add x and y coordinates if they exist in the CSV
        if (xIndex !== -1 && yIndex !== -1) {
            const x = parseFloat(columns[xIndex]);
            const y = parseFloat(columns[yIndex]);
            if (!isNaN(x) && !isNaN(y)) {
                fixation.x = x;
                fixation.y = y;
            }
        }

        return fixation;
    });

    // Use filename without extension as label
    const label = file.name.replace('.csv', '');

    return {
        label,
        fixations
    };
};

export const handleFileUpload = async (files: FileList): Promise<FixationGroup[]> => {
    const fileArray = Array.from(files);
    const csvFiles = fileArray.filter(file => file.name.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
        throw new Error('No CSV files selected');
    }

    try {
        const fixationGroups = await Promise.all(csvFiles.map(parseCSVFile));
        return fixationGroups.sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
        console.error('Error parsing CSV files:', error);
        throw error;
    }
}; 