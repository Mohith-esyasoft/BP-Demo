import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IBlockchainService } from './blockchain.interface';
import * as crypto from 'crypto';

/**
 * MockBlockchainService simulates a blockchain by:
 * - Generating a deterministic transaction hash (SHA-256 of passportId + dataHash + timestamp)
 * - Persisting blockchainHash and blockchainTx back to BatteryPassport via Prisma
 * - Reading back stored records for verification
 *
 * Replace with a real Web3/Ethereum/Hyperledger adapter in production.
 */
@Injectable()
export class MockBlockchainService implements IBlockchainService {
  private readonly logger = new Logger(MockBlockchainService.name);

  constructor(private readonly prisma: PrismaService) {}

  async storeHash(
    passportId: string,
    dataHash: string,
  ): Promise<{ txHash: string }> {
    const timestamp = Date.now().toString();
    const txHash = crypto
      .createHash('sha256')
      .update(`${passportId}:${dataHash}:${timestamp}`)
      .digest('hex');

    // Persist to the database
    await this.prisma.batteryPassport.update({
      where: { passportId },
      data: {
        blockchainHash: dataHash,
        blockchainTx: `0x${txHash}`,
      },
    });

    this.logger.log(
      `[MOCK BLOCKCHAIN] Stored hash for passport ${passportId}: tx=0x${txHash}`,
    );

    return { txHash: `0x${txHash}` };
  }

  async verifyHash(passportId: string, dataHash: string): Promise<boolean> {
    const passport = await this.prisma.batteryPassport.findUnique({
      where: { passportId },
      select: { blockchainHash: true, blockchainTx: true },
    });

    if (!passport || !passport.blockchainHash) {
      this.logger.warn(
        `[MOCK BLOCKCHAIN] No record found for passport ${passportId}`,
      );
      return false;
    }

    const isValid = passport.blockchainHash === dataHash;
    this.logger.log(
      `[MOCK BLOCKCHAIN] Verify ${passportId}: ${isValid ? 'VALID' : 'TAMPERED'}`,
    );
    return isValid;
  }

  async getRecord(
    passportId: string,
  ): Promise<{ hash: string; timestamp: Date } | null> {
    const passport = await this.prisma.batteryPassport.findUnique({
      where: { passportId },
      select: {
        blockchainHash: true,
        approvedAt: true,
        updatedAt: true,
      },
    });

    if (!passport || !passport.blockchainHash) {
      return null;
    }

    return {
      hash: passport.blockchainHash,
      timestamp: passport.approvedAt || passport.updatedAt,
    };
  }
}
