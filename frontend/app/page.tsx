"use client"
import { createDefaultLockWallet,createSpores } from '../helper/SDK';
import { ALICE } from "../helper/test-keys";
import { useEffect,useState } from 'react';
import Papa from "papaparse";
import DataViewer from '@/components/Dataviewer';
import axios from "axios";


export default function Home() {
  const wallet = createDefaultLockWallet(ALICE.PRIVATE_KEY);
  const [hash,setHash] = useState("");
  const [idx,setIdx] = useState("");
  const [tx,setTx] = useState<any>(null);
  const [data, setData] = useState<any>();
  const load = async()=>{
    // const [idx,tx,hash] = await createSpores(wallet,data);
    // setIdx(idx)
    // setHash(hash)
    // setTx(tx)
    const response = await axios("http://localhost:3030/v1/datas",{
      method:"POST",
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
      data:JSON.stringify(data)
    })
    const result = await response.data;
    console.log(result)
  }
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="mx-auto w-full bg-white">
            {data?(<DataViewer data={data}/>):(
              <div className="py-4 px-9 max-w-[550px]">
              <div className="mb-6 pt-4">
                  <label className="mb-5 block text-xl font-semibold text-[#07074D]">
                      Upload File
                  </label>
                  <div className="mb-8">
                      <input type="file" accept=".csv,.xlsx,.xls" name="file" id="file" className="sr-only" onChange={(e:any) => {
                        const files = e.target.files;
                        if (files) {
                          Papa.parse(files[0],{
                            complete: function(result){
                              setData(result.data)
                            }
                          })
                        }
                      }} />
                      <label htmlFor='file'
                          className="relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center">
                          <div>
                              <span className="mb-2 block text-xl font-semibold text-[#07074D]">
                                  Drop files here
                              </span>
                              <span className="mb-2 block text-base font-medium text-[#6B7280]">
                                  Or
                              </span>
                              <span
                                  className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]">
                                  Browse
                              </span>
                          </div>
                      </label>
                  </div>
                  <div className="rounded-md bg-[#F5F7FB] py-4 px-8">
                      <div className="flex items-center justify-between">
                          <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                              banner-design.png
                          </span>
                          <button className="text-[#07074D]">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                  xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                                      fill="currentColor" />
                                  <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                                      fill="currentColor" />
                              </svg>
                          </button>
                      </div>
                      <div className="relative mt-5 h-[6px] w-full rounded-lg bg-[#E2E5EF]">
                          <div className="absolute left-0 right-0 h-full w-[75%] rounded-lg bg-[#6A64F1]"></div>
                      </div>
                  </div>
              </div>
              
          </div>
            )}
            <div>
                  <button onClick={load}
                      className="hover:shadow-form w-[200px] mb-2 ml-20 rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none">
                      Send File
                  </button>
              </div>
            <div className='ml-20'>
            hash:{hash}<br/>
            tx: {tx&&tx.get('outputs').get(idx)!.cellOutput.type!.args}<br/>
            idx: {idx}
            </div>
        </div>
    </div>
    </div>
  );
}
