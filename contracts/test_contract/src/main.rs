// use csv::{ReaderBuilder, StringRecord};
mod lib;
#[tokio::main]
async fn main() -> Result<(), reqwest::Error>  {
    let response = reqwest::get("https://a-simple-demo.spore.pro/api/media/0xed725757bb5f3d74574c0a5784cca0706e5935943f78cd97382a31c3f9dc10ed").await?;
    let json_response: Vec<Vec<String>> = response.json().await?;
    // println!("{:?}",json_response);
    let (data,r)= lib::read_data_file(json_response);
    let a = lib::predict(data);
    println!("{:?}",a);
    
    Ok(())
}