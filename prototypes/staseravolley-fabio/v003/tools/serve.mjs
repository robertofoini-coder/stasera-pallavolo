import {serve} from '../tests/server.mjs';const {base}=await serve(Number(process.argv[2]||4193));console.log('V003 local preview: '+base);
