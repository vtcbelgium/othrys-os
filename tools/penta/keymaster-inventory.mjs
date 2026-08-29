import { discoverKeymasterEnvSource, inventoryKeymasterEnv } from '../../runtime/os/keymaster_vault.mjs';
const source=discoverKeymasterEnvSource();
const inventory=inventoryKeymasterEnv(source);
console.log(JSON.stringify({schema:'othrys.os.keymaster-os-inventory.v1',source:{sourceId:source.sourceId,available:source.available,pathDigest:source.pathDigest,readOnly:true},credentialCount:inventory.credentialCount??0,credentials:inventory.credentials??[],secretValuesExposed:false,authorityGranted:false,executionStarted:false},null,2));
