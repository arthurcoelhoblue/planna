/**
 * Handler para upload de imagens
 */

import { Request, Response } from "express";
import { storagePut } from "./storage";

export async function handleImageUpload(req: Request, res: Response) {
  try {
    // Lê o corpo da requisição como buffer
    const chunks: Buffer[] = [];
    
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        
        // Gera nome único para o arquivo
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `ingredients/${timestamp}-${random}.jpg`;

        // Faz upload para S3
        const result = await storagePut(fileName, buffer, "image/jpeg");

        res.json({ url: result.url });
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
        res.status(500).json({ error: "Erro ao fazer upload da imagem" });
      }
    });

    req.on("error", (error) => {
      console.error("Erro na requisição:", error);
      res.status(500).json({ error: "Erro ao processar requisição" });
    });
  } catch (error) {
    console.error("Erro no handler:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

