import {serve} from '../tests/server.mjs';const {base}=await serve(Number(process.argv[2]||4192));console.log('V002 local preview: '+base);
