export default function DataViewer({data}:{data:any}){
    console.log(data.map((dt:any)=>dt))
    return(
            <div className="shadow-lg mt-20 w-full mb-10 rounded-lg overflow-hidden px-10">
                <table className="w-full table-fixed">
                    <thead className="w-full">
                        <tr className="bg-gray-100 w-full">
                            <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">{data[0][0]}</th>
                            <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">{data[0][1]}</th>
                            <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">{data[0][2]}</th>
                            <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">{data[0][3]}</th>
                            <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">{data[0][4]}</th>
                            <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">{data[0][5]}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {data&&data.slice(0,10).map((dt:any,i:any)=>(
                            <tr key={i}>
                                <td className="py-4 px-6 border-b border-gray-200">{data[i+1][0]}</td>
                                <td className="py-4 px-6 border-b border-gray-200 truncate">{data[i+1][1]}</td>
                                <td className="py-4 px-6 border-b border-gray-200">{data[i+1][2]}</td>
                                <td className="py-4 px-6 border-b border-gray-200">{data[i+1][3]}</td>
                                <td className="py-4 px-6 border-b border-gray-200">{data[i+1][4]}</td>
                                <td className="py-4 px-6 border-b border-gray-200">{data[i+1][5]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
    )
}