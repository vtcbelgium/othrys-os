import { discoverKeymasterCredentialSource, inventoryKeymasterCredentials } from '../../runtime/os/keymaster_vault.mjs';
const source=discoverKeymasterCredentialSource();
const inventory=inventoryKeymasterCredentials(source);
console.log(JSON.stringify({schema:'othrys.os.keymaster-os-inventory.v1',source:{sourceId:source.sourceId,sourceType:source.sourceType??'env-file',available:source.available,pathDigest:source.pathDigest??null,encryptedAtRest:source.encryptedAtRest??false,keyProtection:source.keyProtection??null,readOnly:true},credentialCount:inventory.credentialCount??0,credentials:inventory.credentials??[],secretValuesExposed:false,authorityGranted:false,executionStarted:false},null,2));
