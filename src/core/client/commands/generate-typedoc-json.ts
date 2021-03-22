import * as typedoc from 'typedoc'
import { getTypeDocJson } from '../../analyser'

export function generateTypeDocJson() {
    getTypeDocJson("jquery");
}
