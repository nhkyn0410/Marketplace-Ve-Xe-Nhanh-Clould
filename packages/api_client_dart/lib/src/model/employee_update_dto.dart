//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'employee_update_dto.g.dart';

/// EmployeeUpdateDto
///
/// Properties:
/// * [username] 
/// * [contactEmail] 
/// * [role] 
/// * [status] 
/// * [reason] 
@BuiltValue()
abstract class EmployeeUpdateDto implements Built<EmployeeUpdateDto, EmployeeUpdateDtoBuilder> {
  @BuiltValueField(wireName: r'username')
  String? get username;

  @BuiltValueField(wireName: r'contactEmail')
  String? get contactEmail;

  @BuiltValueField(wireName: r'role')
  EmployeeUpdateDtoRoleEnum? get role;
  // enum roleEnum {  DRIVER,  TICKET_STAFF,  SUPPORT_STAFF,  };

  @BuiltValueField(wireName: r'status')
  EmployeeUpdateDtoStatusEnum? get status;
  // enum statusEnum {  ACTIVE,  LOCKED,  DISABLED,  };

  @BuiltValueField(wireName: r'reason')
  String get reason;

  EmployeeUpdateDto._();

  factory EmployeeUpdateDto([void updates(EmployeeUpdateDtoBuilder b)]) = _$EmployeeUpdateDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EmployeeUpdateDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EmployeeUpdateDto> get serializer => _$EmployeeUpdateDtoSerializer();
}

class _$EmployeeUpdateDtoSerializer implements PrimitiveSerializer<EmployeeUpdateDto> {
  @override
  final Iterable<Type> types = const [EmployeeUpdateDto, _$EmployeeUpdateDto];

  @override
  final String wireName = r'EmployeeUpdateDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EmployeeUpdateDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.username != null) {
      yield r'username';
      yield serializers.serialize(
        object.username,
        specifiedType: const FullType(String),
      );
    }
    if (object.contactEmail != null) {
      yield r'contactEmail';
      yield serializers.serialize(
        object.contactEmail,
        specifiedType: const FullType(String),
      );
    }
    if (object.role != null) {
      yield r'role';
      yield serializers.serialize(
        object.role,
        specifiedType: const FullType(EmployeeUpdateDtoRoleEnum),
      );
    }
    if (object.status != null) {
      yield r'status';
      yield serializers.serialize(
        object.status,
        specifiedType: const FullType(EmployeeUpdateDtoStatusEnum),
      );
    }
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EmployeeUpdateDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EmployeeUpdateDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'username':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.username = valueDes;
          break;
        case r'contactEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.contactEmail = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(EmployeeUpdateDtoRoleEnum),
          ) as EmployeeUpdateDtoRoleEnum?;
          if (valueDes == null) continue;
          result.role = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(EmployeeUpdateDtoStatusEnum),
          ) as EmployeeUpdateDtoStatusEnum?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EmployeeUpdateDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EmployeeUpdateDtoBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


class EmployeeUpdateDtoRoleEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRIVER')
  static const EmployeeUpdateDtoRoleEnum DRIVER = _$employeeUpdateDtoRoleEnum_DRIVER;
  @BuiltValueEnumConst(wireName: r'TICKET_STAFF')
  static const EmployeeUpdateDtoRoleEnum TICKET_STAFF = _$employeeUpdateDtoRoleEnum_TICKET_STAFF;
  @BuiltValueEnumConst(wireName: r'SUPPORT_STAFF')
  static const EmployeeUpdateDtoRoleEnum SUPPORT_STAFF = _$employeeUpdateDtoRoleEnum_SUPPORT_STAFF;

  static Serializer<EmployeeUpdateDtoRoleEnum> get serializer => _$employeeUpdateDtoRoleEnumSerializer;

  const EmployeeUpdateDtoRoleEnum._(String name): super(name);

  static BuiltSet<EmployeeUpdateDtoRoleEnum> get values => _$employeeUpdateDtoRoleEnumValues;
  static EmployeeUpdateDtoRoleEnum valueOf(String name) => _$employeeUpdateDtoRoleEnumValueOf(name);
}

class EmployeeUpdateDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const EmployeeUpdateDtoStatusEnum ACTIVE = _$employeeUpdateDtoStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'LOCKED')
  static const EmployeeUpdateDtoStatusEnum LOCKED = _$employeeUpdateDtoStatusEnum_LOCKED;
  @BuiltValueEnumConst(wireName: r'DISABLED')
  static const EmployeeUpdateDtoStatusEnum DISABLED = _$employeeUpdateDtoStatusEnum_DISABLED;

  static Serializer<EmployeeUpdateDtoStatusEnum> get serializer => _$employeeUpdateDtoStatusEnumSerializer;

  const EmployeeUpdateDtoStatusEnum._(String name): super(name);

  static BuiltSet<EmployeeUpdateDtoStatusEnum> get values => _$employeeUpdateDtoStatusEnumValues;
  static EmployeeUpdateDtoStatusEnum valueOf(String name) => _$employeeUpdateDtoStatusEnumValueOf(name);
}

