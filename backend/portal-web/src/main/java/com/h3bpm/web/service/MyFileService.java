package com.h3bpm.web.service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.h3bpm.web.entity.File;
import com.h3bpm.web.mapper.MyFileMapper;
import com.h3bpm.web.vo.FileVo;

@Service
public class MyFileService extends ApiDataService {
	@Autowired
	private MyFileMapper myFileMapper;

	public List<File> findMyFileByParentIdAndKeyword(String parentId, String keyword, String userId) {
		List<File> fileList = null;
		String searchPath = null;

		try {
			// 如果关键字不为空，则查询该目录开头的所有文件及文件夹
			if (keyword != null && !keyword.isEmpty()) {
				// 根目录则查询下面所有文件
				if (parentId == null || parentId.isEmpty()) {
					searchPath = "";
				} else {
					searchPath = myFileMapper.getMyFileById(parentId).getDir();
				}
			}

			fileList = myFileMapper.findMyFileByParentIdAndKeyword(parentId, keyword, searchPath, userId);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return fileList;
	}

	/**
	 * 根据ID获取文件
	 * 
	 * @param fileId
	 * @return
	 */
	public File getMyFileById(String fileId) {
		return myFileMapper.getMyFileById(fileId);
	}

	/**
	 * 根据路径获取文件
	 * 
	 * @param fileId
	 * @return
	 */
	public File getMyFileByPath(String path) {
		return myFileMapper.getMyFileByPath(path);
	}

	/**
	 * 根据用户ID获取用户删除的文件
	 * 
	 * @param createId
	 * @return
	 */
	public List<File> findDeletedMyFileByUserId(String userId) {

		List<File> fileList = null;
		try {
			fileList = myFileMapper.findDeletedMyFileByUserId(userId);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return fileList;

	}

	/**
	 * 新增文件或文件夹
	 * 
	 * @param fileVo
	 * @return 文件ID
	 */
	@Transactional
	public String createMyFile(FileVo fileVo) {
		String uuid = fileVo.getId();
		if (uuid == null) {
			uuid = UUID.randomUUID().toString();
			fileVo.setId(uuid);
		}

		myFileMapper.createMyFile(new File(fileVo));

		return uuid;
	}

	/**
	 * 删除文件或文件夹
	 *
	 * @param fileVo
	 * @return 文件ID
	 */
	@Transactional
	public void deleteMyFile(String fileId) {
		File file = myFileMapper.getMyFileById(fileId);
		file.setIsDelete(true);
		file.setDeleteTime(new Date());

		myFileMapper.updateMyFile(file);
	}

	/**
	 * 新增文件或文件夹
	 *
	 * @param fileVo
	 * @return 文件ID
	 */
	@Transactional
	public void updateMyFile(FileVo fileVo) {
		myFileMapper.updateMyFile(new File(fileVo));
	}
}
